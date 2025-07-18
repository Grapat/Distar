#!/bin/sh

FLAG_FILE=".migrated"

if [ ! -f "$FLAG_FILE" ]; then
  echo "📦 Running Sequelize migration..."
  npx sequelize-cli db:migrate || echo "❌ Migration failed"

  echo "🌱 Running Sequelize seeders..."
  npx sequelize-cli db:seed:all || echo "❌ Seeder failed"

  echo "✅ Migration and seed completed (flag created)"
  touch "$FLAG_FILE"
else
  echo "⚠️ Already migrated and seeded, skipping..."
fi

echo "🚀 Starting the app..."
npm start
