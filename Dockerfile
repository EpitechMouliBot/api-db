FROM mysql
# RUN git clone https://github.com/EpitechMouliBot/api-db.git .
WORKDIR /app/api-database
EXPOSE 3306
COPY ./api-db.sql /docker-entrypoint-initdb.d/