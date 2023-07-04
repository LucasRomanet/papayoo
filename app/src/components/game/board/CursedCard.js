const CursedCard = ({ cursedCardColor }) => {
    return (
        <div>
            Carte Maudite : <div className={[cursedCardColor, "maudite"].join(' ')}>7</div>
        </div>
    );
};

export default CursedCard;