module.exports = {
    config: {
        user: "sa",
        password: "zlt123",
        server: "192.168.36.2", // You can use "localhost\\instance" to connect to named instance 
        database: "zlt-monitors",
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 15000
        }
    }
}