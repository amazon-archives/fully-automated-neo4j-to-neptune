# Overview

This AWS CDK app helps you migrate the simple Neo4j movies graph database to
Amazon Neptune in a hands-free, fully-automated way

# Architecture

![architecture](/bootstrapper/images/neo4j-neptune.png)

# Prerequisites

- Install
  [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Install](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  and
  [Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
  [AWS CLI](https://aws.amazon.com/cli/)
- The [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html)
  configured in the AWS profile must have the privileges to provision the
  following resources. Please note, while working with AWS acounts, IAM users
  and policies always follow
  [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html):
  - Amazon VPC and Subnets
  - Amazon EC2 instance
  - Amazon S3 bucket
  - Amazon S3 Gateway VPC Endpoint
  - An Amazon Neptune cluster
- Install
  [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)

# Configuration

- Verify the app specific configuration saved in `bootstrapper/cdk.json` to
  ensure you have the right values for your environment
  - (required) replace `<your-key-pair>` with your own
    [EC2 key pair](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/EMRforDynamoDB.Tutorial.EC2KeyPair.html)
  - (optional) replace `pass@word1` with a strong password that you want to set
    for your Neo4j instance
  - (optional but recommended) replace `0.0.0.0/0` with your current IP address
    e.g. 8.8.8.8/32 [Know your IP address](https://www.whatsmyip.org/)

The contents of the file looks like this. Feel free to change the values before
running the app

```
{
  "app": "node bin/bootstrapper.js",
  "context": {
    "vpc_cidr": "192.168.0.0/16",
    "ec2_class": "t3a",
    "ec2_type": "xlarge",
    "ec2_key_pair": "<your-key-pair>",
    "sg_fromIp": "0.0.0.0/0",
    "neptune_port": 8182,
    "neo4j_uid": "neo4j",
    "neo4j_pwd": "pass@word1"
  }
}
```

# Download

Download the code using the following git command

```
$ git clone https://github.com/aws-samples/fully-automated-neo4j-to-neptune.git
```

# Run

Run the app

```
$ cd fully-automated-neo4j-to-neptune/bootstrapper
$ npm install
$ npm run deploy
```

The app will ask questions while showing you what it's trying to create. Just
respond with a 'y' to let it do its stuff. It will take about 10 minutes to
deploy the infrastructure and run the required code to automate the migration.

After running the app, you'll see an output similar to the following:
![output](/bootstrapper/images/neo4j-neptune-output.png)

Please note: the code uses the `default` AWS CLI profile

# Destroy

To cleanup after you are done

```
$ npm run destroy
```

Please note: this command doesn't delete the Amazon S3 bucket it creates, you'll
have to do it manually
