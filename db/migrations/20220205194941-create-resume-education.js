"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ResumeEducations", {
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
      education_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        references: {
          model: "Education",
          key: "id",
        },
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ResumeEducations");
  },
};
