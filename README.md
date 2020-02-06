# Overview

This AWS CDK app helps you migrate the simple Neo4j movies graph database to
Amazon Neptune in a hands-free, fully-automated way

# Architecture

![architecture](/bootstrapper/images/fully-automated-neptune-arch.png)

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

# Download, run, and dispose

Download the code using the following git command

```
$ git clone https://github.com/sahays/fully-automated-neo4j-to-neptune.git
```

Run the app

```
$ cd fully-automated-neo4j-to-neptune/bootstrapper
$ npm run deploy
```

After running the app, you'll see an output similar to the following:
![output](/bootstrapper/images/fully-automated-neptune-output.png)

Please note: the code uses the `default` AWS CLI profile

To cleanup after you are done

```
$ npm run destroy
```

Please note: you'll have to manually delete the Amazon S3 bucket that's created
by running this app

# Configuration

App specific configuration is saved in `cdk.json` file and it looks like this.
Feel free to change the values before running the app

```
{
  "app": "node bin/bootstrapper.js",
  "context": {
    "bucket_identifier": "neo4j-neptune-blog",
    "vpc_cidr": "192.168.0.0/16",
    "ec2_class": "t3",
    "ec2_type": "medium",
    "ec2_key_pair": "<your-key-pair>",
    "sg_fromIp": "0.0.0.0/0",
    "ami_name": "Neo4j-Community-3.5.14-Gremlin-us-west-2",
    "ami_owner": "865118636886",
    "neptune_port": 8182,
    "neo4j_uid": "neo4j",
    "neo4j_pwd": "pass@word1"
  }
}
```
