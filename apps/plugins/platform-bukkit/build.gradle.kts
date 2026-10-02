import org.gradle.language.jvm.tasks.ProcessResources

repositories {
    maven("https://hub.spigotmc.org/nexus/content/repositories/snapshots/")
    maven("https://oss.sonatype.org/content/repositories/snapshots/")
}

dependencies {
    implementation(project(":minelog-core"))
    compileOnly("org.spigotmc:spigot-api:1.8.8-R0.1-SNAPSHOT") {
        exclude(group = "net.md-5", module = "bungeecord-chat")
        exclude(group = "com.google.code.gson", module = "gson")
    }
    compileOnly("net.md-5:bungeecord-chat:1.20-R0.2")
    compileOnly("com.google.code.gson:gson:2.8.0")
}

val modVersion: String by project

tasks.named<ProcessResources>("processResources") {
    expand("modVersion" to modVersion)
}

tasks.withType<JavaCompile> {
    options.release.set(8)
}

tasks.named<Jar>("jar") {
    from(project(":minelog-core").extensions.getByType<SourceSetContainer>()["main"].output)
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    archiveBaseName.set("minelog-bukkit")
}
