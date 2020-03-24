// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const StartupScript = () => {
	const setupDockerScript = ({
		neo4jEc2,
		s3Bucket,
		neptune_host,
		neptune_role,
		aws_region
	}) => {
		const init = [
			"{",
			"sudo su #",
			"cd /",
			"yum update -y",
			"export S3BUCKET_NAME=" + s3Bucket,
			"export NEPTUNE_HOST=" + neptune_host,
			"export NEPTUNE_ROLE=" + neptune_role,
			"export AWS_REGION=" + aws_region
		];
		neo4jEc2.addUserData(init.join("\n"));

		// install docker
		const installDocker = [
			"mkdir -p temp",
			"amazon-linux-extras install docker",
			"service docker start",
			"usermod -a -G docker ec2-user"
		];
		neo4jEc2.addUserData(installDocker.join("\n"));

		const neo4jDocker = [
			'docker run -d --ulimit nofile=50000:60000 -e S3BUCKET_NAME -e NEPTUNE_HOST -e NEPTUNE_ROLE -e AWS_REGION --name neo4j-400 --mount type=bind,source="$(pwd)"/temp,target=/var/lib/neo4j/output sanjeets/neo4j-400-export:latest && docker exec -i -e S3BUCKET_NAME -e NEPTUNE_HOST -e NEPTUNE_ROLE -e AWS_REGION neo4j-400 sh -c /main.sh'
		];
		neo4jEc2.addUserData(neo4jDocker.join("\n"));

		const uploadDataToS3 = [
			'aws s3 cp /temp/ s3://"${S3BUCKET_NAME}"/neo4j-data --recursive',
			`curl -X POST -H 'Content-Type: application/json' https://${neptune_host}:8182/loader -d '{ \"source\" : \"s3://${s3Bucket}/neo4j-data\", \"format\" : \"csv\", \"iamRoleArn\" : \"${neptune_role}\", \"region\" : \"${aws_region}\", \"failOnError\" : \"FALSE\" }'`
		];
		neo4jEc2.addUserData(uploadDataToS3.join("\n"));

		// always the last
		const last = ["} 2>&1 | tee user-data.log"];
		neo4jEc2.addUserData(last.join("\n"));
	};

	return { setupDockerScript };
};

module.exports = { StartupScript };
