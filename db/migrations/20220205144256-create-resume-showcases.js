"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ResumeShowcases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      resume_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Resumes",
          key: "id",
        },
        allowNull: false,
      },
      showcase_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Showcases",
          key: "id",
        },
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ResumeShowcases");
  },
};
