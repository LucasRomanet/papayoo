const RequiredColor = ({ askedColor }) => {
    return (
        <div>
            Couleur demandée:
            <div className={[(askedColor) ? askedColor : "indefini", "playable"].join(' ')}>
                ‎
            </div>
        </div>
    );
};

export default RequiredColor;