create table log
(
    logger       uuid         not null,
    service_name varchar(255) not null,
    hostname     varchar(255) not null,
    timestamp    timestamp    not null,
    data         jsonb        not null,
    tag          varchar(20)  not null
);

alter table log
    owner to logging_dev_user;

create table loggers
(
    id      uuid         not null,
    user_id varchar(64)  not null,
    name    varchar(255) not null,
    api_key varchar(255) not null
);

alter table loggers
    owner to logging_dev_user;

create unique index loggers_id_uindex
    on loggers (id);

