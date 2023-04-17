import { Route53Client, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";

const HostedZoneId = process.env.HostedZoneId;


/**
 * 
 * @param {String} ip Public Ip of the EC2 Instance
 * @param {String} region Region of the EC2 Instance
 * @returns an Array of the Route53 Upsert responses
 */
async function changeDNSEntry(ip, region, records) {
    //AWS-SDK Client to work with Route53
    const route53Client = new Route53Client({ region });
    let responses = [];
    try {
        // Iterate through all DNS Names of my application
        for (let i = 0; i < records.names.length; i++) {
            // Get one DNS Name of my application
            const name = records.names[i];
            console.log("Changing: " + name);
            // Configure Input for the Change of the Route 53 Record Set
            const input = {
                HostedZoneId: HostedZoneId,
                ChangeBatch: {
                    Comment: "Ip of EC2 Instance",
                    Changes: [
                        {
                            Action: "UPSERT",
                            ResourceRecordSet: {
                                Name: name,
                                Type: "A",
                                ResourceRecords: [
                                    {
                                        Value: ip,
                                    },
                                ],
                                "TTL": 300,
                            },
                        },
                    ],
                },
            };
            // Create Command for the Route53 Client
            const command = new ChangeResourceRecordSetsCommand(input);
            // Execute the Command
            const response = await route53Client.send(command);
            console.log("Route53 Response: " + JSON.stringify(response));
            // Save response of the command in an array
            responses.push(response);
        }
        // Return the response array
        return responses;
    } catch (error) {
        throw new Error(error);
    }
}

export {
    changeDNSEntry
}