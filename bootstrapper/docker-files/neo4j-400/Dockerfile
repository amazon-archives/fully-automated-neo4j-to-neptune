FROM neo4j:4.0.0

ENV NEO4J_EXPORT_FILE=neo4j-export.csv
ENV NEO4J_USERNAME=neo4j
ENV NEO4J_PASSWORD=pass@word1
ENV NEO4J_AUTH=${NEO4J_USERNAME}/${NEO4J_PASSWORD}

RUN wget --directory-prefix ${NEO4J_HOME}/plugins/ https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.0.0.2/apoc-4.0.0.2-all.jar \
&& echo "apoc.export.file.enabled=true" >> ${NEO4J_HOME}/conf/neo4j.conf \
&& echo "dbms.security.procedures.unrestricted=apoc.*" >> ${NEO4J_HOME}/conf/neo4j.conf \
&& echo "CALL apoc.export.csv.all('${NEO4J_EXPORT_FILE}', {d:','});" >> apoc-export.txt \
&& wget https://raw.githubusercontent.com/aws-samples/fully-automated-neo4j-to-neptune/master/bootstrapper/movies-cypher.txt \
&& wget https://d1rwcpsuqsa5hl.cloudfront.net/neo4j-to-neptune.jar 

RUN echo 'neo4j-admin set-initial-password ${NEO4J_PASSWORD}' >> main.sh \
&& echo 'cypher-shell -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD} :history;' >> main.sh \
&& echo 'until [ $? -eq 0 ];' >> main.sh \
    && echo 'do' >> main.sh \
        && echo 'echo waiting for cypher-shell...' >> main.sh \
        && echo 'cypher-shell -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD} :history;' >> main.sh \
    && echo 'done' >> main.sh \
&& echo 'cypher-shell -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD}  -f movies-cypher.txt' >> main.sh \
&& echo 'cypher-shell -u ${NEO4J_USERNAME} -p ${NEO4J_PASSWORD} -f apoc-export.txt' >> main.sh \
&& echo 'java -jar neo4j-to-neptune.jar convert-csv -i ${NEO4J_HOME}/import/${NEO4J_EXPORT_FILE} -d output --infer-types' >> main.sh \
&& chmod +x main.sh

EXPOSE 7473 7474 7687