package models

object CodeGen extends App {
    slick.codegen.SourceCodeGenerator.run(
        "slick.jdbc.PostgresProfile",
        "org.postgresql.Driver",
        "jdbc:postgresql://localhost/puppylist?user=mlewis&password=password",
        "/home/p6/projects/puppies/puppies/app",
        "models", None, None, true, false
    )
}
