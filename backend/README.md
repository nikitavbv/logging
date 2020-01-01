to build, install `autoconf`:

```
pacman -S autoconf2.13
```

Run database using `docker-compose up -d` and set database url:
```bash
export DATABASE_URL=postgres://logging_dev_user:logging_dev_password@localhost:5432/postgres
```

(this is because sql queries are checked during compile time)