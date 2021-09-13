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
  } = props.overviewData;

  return (
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
        }}
      >
        <h3>System Entrance</h3>
        {numberOfExchanges && (
          <h5>{`Number of Exchanges: ${numberOfExchanges}`}</h5>
        )}
        {msgsPublished && (
          <h5>{`Messages received: ${msgsPublished.totalMsgs}`}</h5>
        )}
        {msgsPublished && (
          <h5>{`Incoming message rate: ${msgsPublished.avgRate}`}</h5>
        )}
        {msgsDroppedAsUnroutable && (
          <h5>{`Unroutable messages: ${msgsDroppedAsUnroutable.totalMsgs}`}</h5>
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
        }}
      >
        <h3>System Processing</h3>
        {numberOfConsumers && (
          <h5>{`Number of Filters: ${numberOfConsumers}`}</h5>
        )}
        {msgsAcknowledged && (
          <h5>{`Messages processed by Filters: ${msgsAcknowledged.totalMsgs}`}</h5>
        )}
        {msgsAcknowledged && (
          <h5>{`Message process rate by Filters: ${msgsAcknowledged.avgRate}`}</h5>
        )}
        {numberOfQueues && <h5>{`Number of Queues: ${numberOfQueues}`}</h5>}
        {msgsInQueues && (
          <h5>{`Number of messages in Queues: ${msgsInQueues.totalMsgs}`}</h5>
        )}
        {bytesOfMsgsInQueues && (
          <h5>{`Number of bytes in Queues: ${bytesOfMsgsInQueues}`}</h5>
        )}
      </div>
    </div>
  );
};

export default OverviewLiveData;
