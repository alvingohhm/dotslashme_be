const jsonMessages = (status, process, message, data) => {
  const result = {
    status,
    process: process === "yes" ? "passed" : "failed",
    message,
    data,
  };

  return result;
};

module.exports = jsonMessages;
