import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

/**
 * 
 * @param {String} region Region where to get the EC2 Instance details from
 * @param {String} ec2InstanceId Id of the EC2 Instance
 * @returns Object containing the public ip and the tags of the instance
 */
async function getEC2Detail(region, ec2InstanceId) {
    // AWS SDK Client for EC2
    const ec2Client = new EC2Client({ region });
    // Filter for the DescribeInstanceCommand
    const input = {
        InstanceIds: [
            ec2InstanceId,
        ],
    };
    // Create Command for EC2 Client
    const command = new DescribeInstancesCommand(input);
    try {
        // Execture the Command
        const response = await ec2Client.send(command);
        // Get public ip and tags from the response
        const publicIP = response.Reservations[0].Instances[0].PublicIpAddress;
        const tags = response.Reservations[0].Instances[0].Tags;
        // Return the Information
        return {
            publicIP,
            tags
        };
    } catch (error) {
        throw new Error(error);
    }
}

export {
    getEC2Detail
}