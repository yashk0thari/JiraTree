# JiraTree
<h2> State of the art workspace management tool </h2>

<h3> CockroachDB Setup </h3>

Our database service is CockroachDB. Since the web application is not hosted, you will have to setup CockroachDB manually. You can follow the steps from [here](https://www.cockroachlabs.com/docs/stable/build-a-nodejs-app-with-cockroachdb.html).

1. In the link provided above, select "Use node-postgres" and "Use CockroachDB serverless" as the Installation method. We already have a cluster set-up which you will need to get access to. This can be accomplished by sending us an email, requesting access to the Jira-Tree Cluster. We will respond with an invitation to join our cluster and also allocate a sql_user and password for you. 

2. Connect to our Cluster named jira-tree using the purple "Connect" Button. Use the sql_user provided, leave Database as "defaultdb", Select option/language as "Javascript", tool as "node-postgres", and follow the steps to set up cockroachdb in your local system. Read the CockroachDB documentation for any help. You can also contact us if some persistant issue arises with setting up CockroachDB. 

<h3> Git Clone and Running Locally </h3>

Now that CockroachDB is set-up correctly, clone our project from github using the following command:
```
git clone https://github.com/yashk0thari/JiraTree.git
```

Now change directory to the project using:
```
cd JiraTree
```

Open VSCode to this path and change the branch to origin/dev.

Open a VSCode terminal and change directory to the server using:
```
cd server
```

You will need to install all the modules to successfully run the app. Therefore, execute the following command:
```
npm install
```

Now, you can run the application using:
```
npm run run
```

This would run the program on http://localhost:8080/

Play around and have fun using JiraTree :)




