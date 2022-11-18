-- Create Schemas:
CREATE SCHEMA IF NOT EXISTS jt_user;
CREATE SCHEMA IF NOT EXISTS jt_task;
CREATE SCHEMA IF NOT EXISTS jt_sprint;

-- Initialize Schemas:
CREATE TABLE IF NOT EXISTS jt_user.users (
    user_uid UUID PRIMARY KEY,
    name STRING,
    email STRING,
    password STRING,
    role STRING
);

CREATE TABLE IF NOT EXISTS jt_task.tasks (
    task_uid UUID PRIMARY KEY,
    task_id STRING,
    status STRING,
    description STRING,
    in_backlog STRING,
    user_uid UUID,
    CONSTRAINT FK_TASK_USER FOREIGN KEY (user_uid)
        REFERENCES jt_user.users (user_uid),
    sprint_uid UUID,
    CONSTRAINT FK_TASK_SPRINT FOREIGN KEY (sprint_uid)
        REFERENCES jt_sprint.sprints (sprint_uid)
);

CREATE TABLE IF NOT EXISTS jt_sprint.sprints (
    sprint_uid UUID PRIMARY KEY,
    sprint_id STRING,
    status STRING,
    goal STRING
);

-- Default Table Entries: 
INSERT INTO jt_sprint.sprints (sprint_id, status, goal) VALUES ('0000', 'IN PROGRESS', 'FINISH PROJECT');
INSERT INTO jt_user.users (name, email, password, role) VALUES ('UNASSIGNED', 'NULL', 'NULL', 'NULL');

-- Insert Tasks:
INSERT INTO jt_task.tasks (task_id, status, description, in_backlog, user_uid, sprint_uid) VALUES ('123TEST321', 'NOT STARTED', 'JUST A TEST', 'TRUE', (SELECT user_uid FROM jt_user.users WHERE name = 'UNASSIGNED'), (SELECT sprint_uid FROM jt_sprint.sprints WHERE sprint_id = '0000'))