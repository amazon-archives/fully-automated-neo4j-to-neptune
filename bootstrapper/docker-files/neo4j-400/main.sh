#!/bin/bash
sed -i "s/NEO4J_EXPORT_FILE/${NEO4J_EXPORT_FILE}/g" ${NEO4J_HOME}/apoc-export.txt
neo4j-admin set-initial-password "${NEO4J_PASSWORD}"
cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" :history;
until [ $? -eq 0 ];
do
    echo 'waiting for cypher-shell...'
    cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" :history;
done
cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}"  -f movies-cypher.txt
cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" -f apoc-export.txt
java -jar neo4j-to-neptune.jar convert-csv -i "${NEO4J_HOME}"/import/"${NEO4J_EXPORT_FILE}" -d output --infer-types
curl -X POST -H 'Content-Type: application/json' https://"${NEPTUNE_HOST}":8182/loader -d "{ \"source\" : \"s3://${S3BUCKET_NAME}/neo4j-data\", \"format\" : \"csv\", \"iamRoleArn\" : \"arn:aws:iam::865118636886:role/${NEPTUNE_ROLE}\", \"region\" : \"${AWS_REGION}\", \"failOnError\" : \"FALSE\" }"