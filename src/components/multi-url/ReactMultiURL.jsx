import * as React from 'react';
import isURLFn from './isURL';
class ReactMultiURL extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            urls: [],
            inputValue: '',
        };
        this.findEmailAddress = (value, isEnter) => {
            const { validateURL } = this.props;
            let validURLs = [];
            let inputValue = '';
            const re = /[ ,;]/g;
            const isURL = validateURL || isURLFn;
            console.log("Email value", value)
            const addEmails = (url) => {
                const urls = this.state.urls;
                console.log("validURLs", urls);
                for (let i = 0, l = urls.length; i < l; i++) {
                    if (urls[i] === url) {
                        return false;
                    }
                }
                validURLs.push(url);
                console.log("validURLs", validURLs);
                return true;
            };
            if (value !== '') {
                if (re.test(value)) {
                    let arr = value.split(re).filter(n => {
                        return n !== '' && n !== undefined && n !== null;
                    });
                    do {
                        if (isURL('' + arr[0])) {
                            addEmails('' + arr.shift());
                        }
                        else {
                            if (arr.length === 1) {
                                /// 마지막 아이템이면 inputValue로 남겨두기
                                inputValue = '' + arr.shift();
                            }
                            else {
                                arr.shift();
                            }
                        }
                    } while (arr.length);
                }
                else {
                    if (isEnter) {
                        const isValid = isURL(value)
                        console.log("isURL(" + value + ")", isValid)
                        if (isValid) {
                            console.log("Adding urls.")
                            addEmails(value);
                        }
                        else {
                            inputValue = value;
                        }
                    }
                    else {
                        inputValue = value;
                    }
                }
            }
            this.setState({
                urls: [...this.state.urls, ...validURLs],
                inputValue: inputValue,
            });
            if (validURLs.length && this.props.onChange) {
                this.props.onChange([...this.state.urls, ...validURLs]);
            }
        };
        this.onChangeInputValue = (value) => {
            this.findEmailAddress(value);
        };
        this.removeEmail = (index) => {
            this.setState(prevState => {
                return {
                    urls: [
                        ...prevState.urls.slice(0, index),
                        ...prevState.urls.slice(index + 1),
                    ],
                };
            }, () => {
                if (this.props.onChange) {
                    this.props.onChange(this.state.urls);
                }
            });
        };
        this.handleOnKeydown = (e) => {
            switch (e.which) {
                case 13:
                case 9:
                    e.preventDefault();
                    break;
                case 8:
                    if (!e.currentTarget.value) {
                        this.removeEmail(this.state.urls.length - 1);
                    }
                    break;
                default:
            }
        };
        this.handleOnKeyup = (e) => {
            switch (e.which) {
                case 13:
                case 9:
                    this.findEmailAddress(e.currentTarget.value, true);
                    break;
                default:
            }
        };
        this.handleOnChange = (e) => this.onChangeInputValue(e.currentTarget.value);
        this.handleOnBlur = (e) => {
            this.setState({ focused: false });
            this.findEmailAddress(e.currentTarget.value, true);
        };
        this.handleOnFocus = () => this.setState({
            focused: true,
        });
        this.emailInputRef = React.createRef();
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.propsEmails !== nextProps.urls) {
            return {
                propsEmails: nextProps.urls || [],
                urls: nextProps.urls || [],
                inputValue: '',
                focused: false,
            };
        }
        return null;
    }
    render() {
        const { focused, urls, inputValue } = this.state;
        const { style, getLabel, className = '', noClass, placeholder } = this.props;
        // removeEmail
        return (React.createElement("div", { className: `${className} ${noClass ? '' : 'react-multi-email'} ${focused ? 'focused' : ''} ${inputValue === '' && urls.length === 0 ? 'empty' : ''}`, style: style, onClick: () => {
                if (this.emailInputRef.current) {
                    this.emailInputRef.current.focus();
                }
            } },
            placeholder ? React.createElement("span", { "data-placeholder": true }, placeholder) : null,
            urls.map((url, index) => getLabel(url, index, this.removeEmail)),
            React.createElement("input", { ref: this.emailInputRef, type: "text", value: inputValue, onFocus: this.handleOnFocus, onBlur: this.handleOnBlur, onChange: this.handleOnChange, onKeyDown: this.handleOnKeydown, onKeyUp: this.handleOnKeyup })));
    }
}
export default ReactMultiURL;
