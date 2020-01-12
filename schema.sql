create table log
(
    logger       uuid         not null,
    service_name text not null,
    hostname     text not null,
    timestamp    timestamp    not null,
    data         jsonb        not null,
    tag          text  not null,
    delete_at timestamp not null
);

alter table log
    owner to logging_dev_user;

create table logger_access
(
    logger uuid        not null,
    "user" text not null
);

alter table logger_access
    owner to logging_dev_user;


create table loggers
(
    id      uuid         not null,
    name    text not null,
    api_key text not null
);

alter table loggers
    owner to logging_dev_user;

create unique index loggers_id_uindex
    on loggers (id);


create table queries
(
    id   uuid         not null,
    name text not null,
    code text         not null
);

alter table queries
    owner to logging_dev_user;

create unique index queries_id_uindex
    on queries (id);

create table user_queries
(
    user_id  text not null,
    query_id uuid not null,
    starred boolean not null
)

alter table user_queries
    owner to logging_dev_user;