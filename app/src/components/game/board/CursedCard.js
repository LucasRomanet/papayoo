const CursedCard = ({ color }) => {
    return (
        <div>
            Carte Maudite : <div className={[color, "maudite"].join(' ')}>7</div>
        </div>
    );
};

export default CursedCard;