const dbinit_functions = {
    // TEST:
    select_now: `SELECT NOW();`,
    
    // INITIALIZE SCHEMAS:
    init_schemas: `
        CREATE SCHEMA IF NOT EXISTS jt_user;
        CREATE SCHEMA IF NOT EXISTS jt_task;
        CREATE SCHEMA IF NOT EXISTS jt_sprint;
        CREATE SCHEMA IF NOT EXISTS jt_project;
    `,

    // INITIALIZE TABLES:
    init_tables: `
        CREATE TABLE IF NOT EXISTS jt_user.users (
            user_uid INT PRIMARY KEY DEFAULT unique_rowid(),
            name STRING,
            email STRING,
            password STRING,
            role STRING
        );

        CREATE TABLE IF NOT EXISTS jt_sprint.sprints (
            sprint_uid INT PRIMARY KEY DEFAULT unique_rowid(),
            sprint_id STRING,
            status STRING,
            goal STRING,
            prev_sprint INT,
            project_uid INT,
            CONSTRAINT FK_TASK_PROJECT FOREIGN KEY (project_uid)
                REFERENCES jt_project.projects (project_uid)
        );

        CREATE TABLE IF NOT EXISTS jt_task.tasks (
            task_uid INT PRIMARY KEY DEFAULT unique_rowid(),
            task_name STRING,
            status STRING,
            description STRING,
            datetime TIMESTAMP,
            user_uid INT,
            CONSTRAINT FK_TASK_USER FOREIGN KEY (user_uid)
                REFERENCES jt_user.users (user_uid),
            sprint_uid INT,
            CONSTRAINT FK_TASK_SPRINT FOREIGN KEY (sprint_uid)
                REFERENCES jt_sprint.sprints (sprint_uid),
            project_uid INT,
            CONSTRAINT FK_TASK_PROJECT FOREIGN KEY (project_uid)
                REFERENCES jt_project.projects (project_uid),
            deadline TIMESTAMP DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS jt_project.projects (
            project_uid INT PRIMARY KEY DEFAULT unique_rowid()
        );
    `,

    // Initialize Defaults:
    defaults: `
        
    `
}

module.exports = dbinit_functions;