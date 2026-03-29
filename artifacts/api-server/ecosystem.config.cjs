module.exports = {
  apps: [
    {
      name: "etherbound",
      script: "dist/index.js",
      cwd: "/root/EtherBoundIdle/artifacts/api-server",
      env: {
        DATABASE_URL: "postgresql://postgres.pdzevkhfpqldvjiyrrxk:ZitroneMelone123.@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
      }
    }
  ]
};
