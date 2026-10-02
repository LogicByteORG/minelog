dependencies {
    testImplementation("junit:junit:4.13.2")
}

tasks.withType<JavaCompile> {
    options.release.set(8)
}

tasks.withType<Test> {
    useJUnit()
}
