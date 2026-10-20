import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import org.gradle.language.jvm.tasks.ProcessResources

plugins {
    id("com.gradleup.shadow") version "8.3.6"
}

repositories {
    maven("https://repo.papermc.io/repository/maven-public/")
    maven("https://repo.skriptlang.org/releases")
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

// The Skript syntax lives in its own source set because Skript needs Java 17 while the
// plugin itself stays on Java 8. It ships inside the same jar and is only loaded when
// Skript is installed.
val skript = sourceSets.create("skript")

dependencies {
    "skriptCompileOnly"(sourceSets["main"].output)
    "skriptCompileOnly"(project(":minelog-core"))
    "skriptCompileOnly"("io.papermc.paper:paper-api:1.20.4-R0.1-SNAPSHOT")
    "skriptCompileOnly"("com.github.SkriptLang:Skript:2.9.5")
    "skriptCompileOnly"("org.jetbrains:annotations:24.1.0")
}

val modVersion: String by project

tasks.named<ProcessResources>("processResources") {
    expand("modVersion" to modVersion)
}

tasks.withType<JavaCompile> {
    options.release.set(if (name == "compileSkriptJava") 17 else 8)
}

// bStats asks every plugin to ship its own relocated copy so two plugins never
// share one Metrics class. The shaded jar keeps the plain jar's file name, so
// the release workflow and the Hangar publication pick it up unchanged.
tasks.named<ShadowJar>("shadowJar") {
    archiveBaseName.set("minelog-bukkit")
    archiveClassifier.set("")
    relocate("org.bstats", "org.minelog.bukkit.libs.bstats")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    from(skript.output)
}

tasks.named<Jar>("jar") {
    archiveBaseName.set("minelog-bukkit")
    enabled = false
    dependsOn(tasks.named("shadowJar"))
}
