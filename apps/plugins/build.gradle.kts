plugins {
    java
    id("io.papermc.hangar-publish-plugin") version "0.1.4"
}

group = "org.minelog"

val modVersion: String by project
version = modVersion

subprojects {
    apply(plugin = "java")

    version = rootProject.version

    repositories {
        mavenCentral()
    }
}

fun hangarJar(projectPath: String) =
    project(projectPath).tasks.named<Jar>("jar").flatMap { it.archiveFile }

fun hangarVersions(key: String): List<String> =
    ((findProperty(key) as String?) ?: error("Missing $key in gradle.properties"))
        .split(",")
        .map { it.trim() }
        .filter { it.isNotEmpty() }

val hangarNotes = file("/tmp/plugin-notes.md")

hangarPublish {
    publications.register("plugin") {
        id.set("minelog")
        version.set(System.getenv("HANGAR_VERSION") ?: modVersion)
        channel.set(System.getenv("HANGAR_CHANNEL") ?: "Release")
        if (hangarNotes.isFile) changelog.set(hangarNotes.readText())
        System.getenv("HANGAR_API_TOKEN")?.let { apiKey.set(it) }
        platforms {
            register("paper") {
                jar.set(hangarJar(":platform-bukkit"))
                platformVersions.set(hangarVersions("hangarPaperVersions"))
            }
            register("waterfall") {
                jar.set(hangarJar(":platform-bungee"))
                platformVersions.set(hangarVersions("hangarWaterfallVersions"))
            }
            register("velocity") {
                jar.set(hangarJar(":platform-velocity"))
                platformVersions.set(hangarVersions("hangarVelocityVersions"))
            }
        }
    }
}
