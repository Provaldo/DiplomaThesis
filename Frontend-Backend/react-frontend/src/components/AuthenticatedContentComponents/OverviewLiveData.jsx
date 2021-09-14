const OverviewLiveData = (props) => {
  const {
    msgsRcvdByExchanges,
    msgsRoutedByExchanges,
    incomingMsgRateToExchanges,
    bytesOfMsgsInQueues,
    msgsDeliveredToConsumersByActiveQueues,
    msgsAcknowledged,
    msgsDeliveredToConsumers,
    msgsDroppedAsUnroutable,
    msgsPublished,
    msgsInQueues,
    numberOfConsumers,
    numberOfExchanges,
    numberOfQueues,
    DBdata,
  } = props.overviewData;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          margin: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "black",
            padding: 10,
          }}
        >
          <h3>System Entrance</h3>
          {numberOfExchanges && (
            <h5>{`Number of Exchanges: ${numberOfExchanges}`}</h5>
          )}
          {msgsPublished && (
            <h5>{`Messages received: ${msgsPublished.currentDifference}`}</h5>
          )}
          {msgsPublished && (
            <h5>{`Incoming message rate: ${msgsPublished.avgRate}`}</h5>
          )}
          {msgsDroppedAsUnroutable && (
            <h5>{`Unroutable messages: ${msgsDroppedAsUnroutable.currentDifference}`}</h5>
          )}
          {msgsDroppedAsUnroutable && (
            <h5>{`Incoming rate of unroutable messages: ${msgsDroppedAsUnroutable.avgRate}`}</h5>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "black",
            padding: 10,
          }}
        >
          <h3>Filter Processing</h3>
          {numberOfConsumers && (
            <h5>{`Number of Filters: ${numberOfConsumers}`}</h5>
          )}
          {msgsAcknowledged && (
            <h5>{`Messages processed by Filters: ${msgsAcknowledged.currentDifference}`}</h5>
          )}
          {msgsAcknowledged && (
            <h5>{`Message process rate by Filters: ${msgsAcknowledged.avgRate}`}</h5>
          )}
          {numberOfQueues && <h5>{`Number of Queues: ${numberOfQueues}`}</h5>}
          {msgsInQueues && (
            <h5>{`Number of messages in Queues: ${msgsInQueues.totalMsgs}`}</h5>
          )}
          {bytesOfMsgsInQueues !== undefined && (
            <h5>{`Number of bytes in Queues: ${bytesOfMsgsInQueues}`}</h5>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "black",
            padding: 10,
          }}
        >
          <h3>Database Entries</h3>
          {DBdata && (
            <h5>{`Number of messages inserted: ${DBdata.timeframeNumberOfMessages}`}</h5>
          )}
          {DBdata && (
            <h5>{`Message insertion rate: ${DBdata.timeframeMessageInsertRate}`}</h5>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          borderTopStyle: "solid",
          borderTopWidth: 2,
          borderTopColor: "green",
          padding: 10,
          alignItems: "baseline",
        }}
      >
        <h3>System - General:</h3>
        {msgsPublished && (
          <h5>{`Total number of messages received: ${msgsPublished.totalMsgs}`}</h5>
        )}
        {msgsDroppedAsUnroutable && (
          <h5>{`Total number of unroutable messages: ${msgsDroppedAsUnroutable.totalMsgs}`}</h5>
        )}
        {msgsAcknowledged && (
          <h5>{`Total number of messages processed by Filters: ${msgsAcknowledged.totalMsgs}`}</h5>
        )}
        {DBdata && (
          <h5>{`Total number of messages inserted to the DB: ${DBdata.totalNumberOfMessages}`}</h5>
        )}
      </div>
    </div>
  );
};

export default OverviewLiveData;
