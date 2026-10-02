repositories {
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    implementation(project(":minelog-core"))
    compileOnly("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
    annotationProcessor("com.velocitypowered:velocity-api:3.3.0-SNAPSHOT")
}

tasks.withType<JavaCompile> {
    options.release.set(17)
}

val modVersion: String by project

tasks.named<JavaCompile>("compileJava") {
    doLast {
        val candidates = listOf(
            file("build/classes/java/main/velocity-plugin.json"),
            file("build/tmp/compileJava/velocity-plugin.json"),
        )
        for (generated in candidates) {
            if (generated.isFile) {
                generated.writeText(
                    generated.readText().replace(
                        "\"version\":\"0.0.0+dev\"",
                        "\"version\":\"$modVersion\"",
                    )
                )
            }
        }
    }
}

tasks.named<Jar>("jar") {
    from(project(":minelog-core").extensions.getByType<SourceSetContainer>()["main"].output)
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    archiveBaseName.set("minelog-velocity")
}
