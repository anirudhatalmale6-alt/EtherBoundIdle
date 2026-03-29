module.exports = {
  apps: [{
    name: "etherbound",
    script: "./artifacts/api-server/dist/index.mjs",
    cwd: "/root/EtherBoundIdle",
    env: {
      PORT: 3000,
      DATABASE_URL: "postgresql://postgres:ZitroneMelone123.@db.pdzevkhfpqldvjiyrrxk.supabase.co:5432/postgres",
      NODE_ENV: "production"
    }
  }]
}
