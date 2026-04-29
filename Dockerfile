# Sử dụng Java 21 như hôm qua mình đã thống nhất
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
# Chui vào thư mục demo để build (Vì pom.xml nằm ở đó)
RUN mvn -f demo/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
# Copy file jar từ thư mục target bên trong demo
COPY --from=build /demo/target/*.jar demo.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","demo.jar"]
