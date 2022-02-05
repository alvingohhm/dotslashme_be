"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ResumeSkills", {
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
      skill_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Skills",
          key: "id",
        },
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ResumeSkills");
  },
};
