const UserForm = (props) => {
    const { name, tag, password } = props.placeholder;
    const { setName, setTag, setPassword } = props.mutator;
    return (
            <form>
                <div className="form-part">
                    <label htmlFor="name">
                        Nom de joueur :
                    </label>
                    <div className="input-group mb-3" >
                        <input className="form-control" type="text"
                                id="name"
                                placeholder="Pseudonyme"
                                value={name}
                                onChange={e => setName(e.target.value)}/>
                        <span className="input-group-text">#</span>
                        <input className="form-control" type="text"
                                id="tag"
                                placeholder="0001 à 9999"
                                value={tag}
                                onChange={e => setTag(e.target.value)}/>
                    </div>

                </div>
                <div className="form-part">
                    <label htmlFor="password">
                        Mot de passe :
                    </label>
                    <input type="password"
                            id="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={e => setPassword(e.target.value)}/>
                </div>
                <a className="btn btn-success" onClick={props.submit}>
                    Valider
                </a>
            </form>
    );
}

export default UserForm;