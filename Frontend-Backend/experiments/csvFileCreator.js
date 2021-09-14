exports.csvFileCreator = (csvData) => {
  console.log(
    "Input_Frequency;Consuming_Frequency;DB_Insert_Frequency;Avg_Input_Frequency;Input_Frequency_Variance;Avg_Consuming_Frequency;Consuming_Frequency_Variance;Avg_DB_Insert_Frequency;DB_Insert_Frequency_Variance"
  );
  for (let i = 0; i < csvData.inputFrequency.rateSamples.length; i++) {
    if (i == 0) {
      console.log(
        csvData.inputFrequency.rateSamples[i],
        ";",
        csvData.consumingFrequency.rateSamples[i],
        ";",
        csvData.dbInsertFrequency.rateSamples[i],
        ";",
        csvData.inputFrequency.average,
        ";",
        csvData.inputFrequency.variance,
        ";",
        csvData.consumingFrequency.average,
        ";",
        csvData.consumingFrequency.variance,
        ";",
        csvData.dbInsertFrequency.average,
        ";",
        csvData.dbInsertFrequency.variance
      );
    } else {
      console.log(
        csvData.inputFrequency.rateSamples[i],
        ";",
        csvData.consumingFrequency.rateSamples[i],
        ";",
        csvData.dbInsertFrequency.rateSamples[i],
        ";;;;;;"
      );
    }
  }
};
