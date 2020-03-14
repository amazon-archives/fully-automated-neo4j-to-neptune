// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const prompts = require("prompts");

const questions = [
  {
    type: "confirm",
    name: "eula",
    initial: true,
    message:
      'This app will download "Neo4j community edition version 4.0.0", "Apache TinkerPop Gremlin console version 3.4.5", "Neo4j APOC library version 4.0.0.2", and will use Neo4j provided built-in "movies" dataset from third-party sources. There are terms and conditions that you need to agree to abide by if you choose to let the app download, install, and configure as explained in "THIRD-PARTY-LICENSES.txt" file. If you do not agree with every term and condition associated with "Neo4j community edition version 4.0.0", "Apache TinkerPop Gremlin console version 3.4.5", "Neo4j APOC library version 4.0.0.2" you can exit now. Do you want to continue?'
  },
  {
    type: (prev) => (prev ? "confirm" : null),
    name: "dataset",
    initial: true,
    message:
      "Do you want to use the built-in Neo4j movies dataset for the migration?"
  }
];

(async () => {
  const onCancel = () => {
    console.log("user cancelled");
  };
  const { eula, dataset } = await prompts(questions, { onCancel });
  if (eula && dataset) {
    console.log("OK. Good to go. Please wait...");
  } else {
    console.log(
      "Thanks! App exiting now... Please ignore the following error."
    );
    process.exit(1);
  }
})();
