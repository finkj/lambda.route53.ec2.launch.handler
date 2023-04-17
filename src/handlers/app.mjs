import * as fs from "fs";

import { getEC2Detail } from "../aws-clients/ec2client.mjs";
import { changeDNSEntry } from "../aws-clients/route53client.mjs";

const records = JSON.parse(fs.readFileSync("./handlers/records.json"));
const TagsFilter = process.env.TagsFilter;


export const handler = async (event) => {
    // Log Event 
    console.log("EC2InstanceLaunchSuccessful: " + JSON.stringify(event));
    // Start the Handling of the Event
    const result = await EC2LaunchHandler(event);
    // Return the result for further processing (not yet in place)
    return result;
}

// Lambda Function to Handle EC2InstacneLaunchSuccessful Events of AWS Autoscaling Groups
/**
 * 
 * @param {*} event AWS Eventbridge Event
 * @returns result of the handling
 */
async function EC2LaunchHandler(event) {
    // Get InstanceId of the Event
    const ec2InstanceId = event.detail.EC2InstanceId;
    // Get Region of the Event
    const region = event.region;
    // Call Function to get more details of the new EC2 Instance
    const instanceDetail = await getEC2Detail(region, ec2InstanceId);
    console.log("Instance Details: " + JSON.stringify(instanceDetail));
    // Get the Public Ip of the new Instance
    const publicIP = instanceDetail.publicIP;
    // As i only want to change the DNS Entry for one of my applications, 
    // i'm checking based on the tags if it is a instance assigned to the applications autoscaling group.
    if (rightInstance(instanceDetail.tags)) {
        await changeDNSEntry(publicIP, region, records);
        // Return success for further handling (not in place)
        return {
            successful: true,
            reason: "Right Instance",
            publicIP,
            region
        };
    } else {
        console.log("WrongInstance");
        // Return insuccess for further handling (insucess means not a instance of my application)
        return {
            successful: false,
            reason: "Wrong Instance",
            publicIP,
            region
        };
    }
}

/**
 * 
 * @param {Array} tags Containing the Tags of an EC2 Instance
 * @returns boolean if it is a Instance belonging to my application
 */
function rightInstance(tags) {
    // instantiate the return value
    let rightInstance = false;
    // Iterate through all tags
    for (const tag of tags) {
        // Check if tag is containing the name of my application
        if (tag.Value.includes(TagsFilter)) {
            // set return value to true
            rightInstance = true;
            console.log(TagsFilter + " Instance");
            // Stop the iteration as we are confident that the instance is belonging to my application
            break;
        }
    }
    return rightInstance;
}