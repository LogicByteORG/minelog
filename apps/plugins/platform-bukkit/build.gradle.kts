import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.gradle.language.jvm.tasks.ProcessResources

plugins {
    id("com.gradleup.shadow") version "8.3.6"
}

repositories {
    maven("https://hub.spigotmc.org/nexus/content/repositories/snapshots/")
    maven("https://oss.sonatype.org/content/repositories/snapshots/")
}

dependencies {
    implementation(project(":minelog-core"))
    implementation("org.bstats:bstats-bukkit:3.2.1")
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

// bStats asks every plugin to ship its own relocated copy so two plugins never
// share one Metrics class. The shaded jar keeps the plain jar's file name, so
// the release workflow and the Hangar publication pick it up unchanged.
tasks.named<ShadowJar>("shadowJar") {
    archiveBaseName.set("minelog-bukkit")
    archiveClassifier.set("")
    relocate("org.bstats", "org.minelog.bukkit.libs.bstats")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

tasks.named<Jar>("jar") {
    archiveBaseName.set("minelog-bukkit")
    enabled = false
    dependsOn(tasks.named("shadowJar"))
}
