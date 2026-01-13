# Build Stage (Nu med Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Vi lägger till encoding-flaggan här också för säkerhets skull
RUN mvn clean package -DskipTests -Dmaven.compiler.encoding=UTF-8

# Run Stage (Nu med Java 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Skapa upload-mappen
RUN mkdir -p /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]