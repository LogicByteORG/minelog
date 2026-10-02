plugins {
    java
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
