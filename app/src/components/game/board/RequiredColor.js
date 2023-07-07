const RequiredColor = ({ color }) => {
    return (
        <div>
            Couleur demandée:
            <div className={[(color) ? color : "indefini", "playable"].join(' ')}>
                ‎
            </div>
        </div>
    );
};

export default RequiredColor;