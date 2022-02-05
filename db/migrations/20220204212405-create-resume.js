"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Resumes", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },
      identifier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      has_phone: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      has_address: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      has_socialmedia: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      job_tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      summary_id: {
        type: Sequelize.UUID,
        onDelete: "SET NULL",
        references: {
          model: "Summaries",
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Resumes");
  },
};
