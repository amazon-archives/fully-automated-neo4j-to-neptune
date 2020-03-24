FROM neo4j:4.0.0

ENV NEO4J_EXPORT_FILE=neo4j-export.csv
ENV NEO4J_USERNAME=neo4j
ENV NEO4J_PASSWORD=pass@word1
ENV NEO4J_AUTH=${NEO4J_USERNAME}/${NEO4J_PASSWORD}
ENV NEPTUNE_HOST=0.0.0.0
ENV S3BUCKET_NAME=mybucket
ENV NEPTUNE_ROLE=NeptuneTrustedS3Role
ENV AWS_REGION=us-west-2

RUN apt-get update -y && apt-get install -y curl

RUN wget --directory-prefix ${NEO4J_HOME}/plugins/ https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.0.0.2/apoc-4.0.0.2-all.jar \
    && echo "apoc.export.file.enabled=true" >> ${NEO4J_HOME}/conf/neo4j.conf \
    && echo "dbms.security.procedures.unrestricted=apoc.*" >> ${NEO4J_HOME}/conf/neo4j.conf 

COPY movies-cypher.txt ${NEO4J_HOME}/
COPY neo4j-to-neptune.jar ${NEO4J_HOME}/
COPY apoc-export.txt ${NEO4J_HOME}/
COPY main.sh /

RUN chmod +x /main.sh

EXPOSE 7473 7474 7687