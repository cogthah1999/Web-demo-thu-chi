# Giai đoạn 1: Build bằng Maven và Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Giai đoạn 2: Chạy bằng Java 21 siêu nhẹ
FROM eclipse-temurin:21-jre-jammy
COPY --from=build /target/*.jar demo.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","demo.jar"]
