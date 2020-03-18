// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const prompts = require("prompts");

const questions = [
  {
    type: "confirm",
    name: "eula",
    initial: true,
    message:
    'The Solution for Fully Automated migration from Neo4j to Amazon Neptune (FAMNN) installer retrieves a number of third-party software packages (such as open source packages) from third-party servers at install-time or build-time ("External Dependencies"). The External Dependencies are subject to license terms that you must accept in order to use FAMNN, including a GPLv3 license. If you do not accept all of the applicable license terms, you should not use FAMNN. We recommend that you consult your company’s open source approval policy before proceeding. \n\n' +
    "Provided below is a list of the External Dependencies and the applicable license terms as indicated by the documentation associated with the External Dependencies as of Amazon's most recent review of such documentation. \n\n" +
    "THIS INFORMATION IS PROVIDED FOR CONVENIENCE ONLY. AMAZON DOES NOT PROMISE THAT THE LIST OR THE APPLICABLE TERMS AND CONDITIONS ARE COMPLETE, ACCURATE, OR UP-TO-DATE, AND AMAZON WILL HAVE NO LIABILITY FOR ANY INACCURACIES. YOU SHOULD CONSULT THE DOWNLOAD SITES FOR THE EXTERNAL DEPENDENCIES FOR THE MOST COMPLETE AND UP-TO-DATE LICENSING INFORMATION. YOUR USE OF THE EXTERNAL DEPENDENCIES IS AT YOUR SOLE RISK. IN NO EVENT WILL AMAZON BE LIABLE FOR ANY DAMAGES, INCLUDING WITHOUT LIMITATION ANY DIRECT, INDIRECT, CONSEQUENTIAL, SPECIAL, INCIDENTAL, OR PUNITIVE DAMAGES (INCLUDING FOR ANY LOSS OF GOODWILL, BUSINESS INTERRUPTION, LOST PROFITS OR DATA, OR COMPUTER FAILURE OR MALFUNCTION) ARISING FROM OR RELATING TO THE EXTERNAL DEPENDENCIES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF AMAZON HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THESE LIMITATIONS AND DISCLAIMERS APPLY EXCEPT TO THE EXTENT PROHIBITED BY APPLICABLE LAW. \n\n" +
    "- Neo4j community edition version 4.0.0 with built-in movies graph dataset (GPLv3 license) \n" +
    "- Apache TinkerPop Gremlin Console version 3.4.5 (Apache license)\n" +
    "- Neo4j APOC library version 4.0.0.2 (Apache license) \n\n" +
    "Do you want to continue?"
  }
];

(async () => {
  const onCancel = () => {
    console.log("user cancelled");
  };
  const { eula } = await prompts(questions, { onCancel });
  if (eula) {
    console.log("OK. Good to go. Please wait...");
  } else {
    console.log(
      "Thanks! App exiting now... Please ignore the following error."
    );
    process.exit(1);
  }
})();
