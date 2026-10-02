import org.gradle.language.jvm.tasks.ProcessResources

repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

val modVersion: String by project

tasks.named<ProcessResources>("processResources") {
    expand("modVersion" to modVersion)
}

dependencies {
    implementation(project(":minelog-core"))
    compileOnly("net.md-5:bungeecord-api:1.20-R0.2")
}

tasks.withType<JavaCompile> {
    options.release.set(8)
}

tasks.named<Jar>("jar") {
    from(project(":minelog-core").extensions.getByType<SourceSetContainer>()["main"].output)
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    archiveBaseName.set("minelog-bungee")
}
