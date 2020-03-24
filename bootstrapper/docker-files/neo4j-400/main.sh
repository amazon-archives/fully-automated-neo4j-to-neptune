#!/bin/bash
{
    sed -i "s/NEO4J_EXPORT_FILE/${NEO4J_EXPORT_FILE}/g" ${NEO4J_HOME}/apoc-export.txt
    cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" :history;
    until [ $? -eq 0 ];
    do
        echo 'waiting for cypher-shell...' >> main.log
        cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" :history;
    done
    cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}"  -f movies-cypher.txt
    cypher-shell -u "${NEO4J_USERNAME}" -p "${NEO4J_PASSWORD}" -f apoc-export.txt
    java -jar neo4j-to-neptune.jar convert-csv -i "${NEO4J_HOME}"/import/"${NEO4J_EXPORT_FILE}" -d output --infer-types
} 2>&1 | tee mainsh.log