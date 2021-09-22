exports.csvFileCreator = (csvData) => {
  console.log(
    "\nInput_Frequency;Consuming_Frequency;DB_Insert_Frequency;Timestamps;Avg_Input_Frequency;Input_Frequency_Variance;Input_Frequency_Std_Dev;Avg_Consuming_Frequency;Consuming_Frequency_Variance;Consuming_Frequency_Std_Dev;Avg_DB_Insert_Frequency;DB_Insert_Frequency_Variance;DB_Insert_Frequency_Std_Dev"
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
        csvData.timestamps[i],
        ";",
        csvData.inputFrequency.average,
        ";",
        csvData.inputFrequency.variance,
        ";",
        csvData.inputFrequency.stdDev,
        ";",
        csvData.consumingFrequency.average,
        ";",
        csvData.consumingFrequency.variance,
        ";",
        csvData.consumingFrequency.stdDev,
        ";",
        csvData.dbInsertFrequency.average,
        ";",
        csvData.dbInsertFrequency.variance,
        ";",
        csvData.dbInsertFrequency.stdDev
      );
    } else {
      console.log(
        csvData.inputFrequency.rateSamples[i],
        ";",
        csvData.consumingFrequency.rateSamples[i],
        ";",
        csvData.dbInsertFrequency.rateSamples[i],
        ";",
        csvData.timestamps[i],
        ";;;;;;;;;"
      );
    }
  }
};
