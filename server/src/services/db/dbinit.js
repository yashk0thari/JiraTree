const dbinit_functions = {
    // TEST:
    select_now: "SELECT NOW();",
    
    // INITIALIZE SCHEMAS:
    init_schemas: `
        CREATE SCHEMA IF NOT EXISTS jt_user;
        CREATE SCHEMA IF NOT EXISTS jt_task;
        CREATE SCHEMA IF NOT EXISTS jt_sprint;
    `,

    // INITIALIZE TABLES:
    init_tables: `
        CREATE TABLE IF NOT EXISTS jt_user.users (
            user_uid UUID PRIMARY KEY,
            name STRING,
            email STRING,
            password STRING,
            role STRING
        );

        CREATE TABLE IF NOT EXISTS jt_sprint.sprints (
            sprint_uid UUID PRIMARY KEY,
            sprint_id STRING,
            status STRING,
            goal STRING
        );

        CREATE TABLE IF NOT EXISTS jt_task.tasks (
            task_uid UUID PRIMARY KEY,
            task_id STRING,
            status STRING,
            description STRING,
            in_backlog BOOLEAN,
            user_uid UUID,
            CONSTRAINT FK_TASK_USER FOREIGN KEY (user_uid)
                REFERENCES jt_user.users (user_uid),
            sprint_uid UUID,
            CONSTRAINT FK_TASK_SPRINT FOREIGN KEY (sprint_uid)
                REFERENCES jt_sprint.sprints (sprint_uid)
        );
    `
}

module.exports = dbinit_functions;