import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../../libs/getComponentDisplayName';
import ONYXKEYS from '../../../../ONYXKEYS';
import FullscreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import compose from '../../../../libs/compose';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: PropTypes.func,

    /** Indicated whether the report data is loading */
    isLoadingReportData: PropTypes.bool,
};

const defaultProps = {
    forwardedRef: () => {},
    isLoadingReportData: true,
};

const withAccountOrRedirectIfNoRecoverCode = (WrappedComponent) => (props) => {
    useEffect(() => {
        if (props.isLoadingReportData && !props.account) {
            return;
        }

        const isCodePage = Navigation.isActiveRoute(ROUTES.SETTINGS_2FA_CODES);
        const isEnabledPage = Navigation.isActiveRoute(ROUTES.SETTINGS_2FA_IS_ENABLED);

        if (props.account && props.account.requiresTwoFactorAuth) {
            if (!isEnabledPage) {
                Navigation.navigate(ROUTES.SETTINGS_2FA_IS_ENABLED); 
            }
            return;
        }

        if ((props.account || !props.account.requiresTwoFactorAuth) && isEnabledPage) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_CODES);
            return;
        }

        if ((!props.account || !props.account.recoveryCodes) && !isCodePage) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_CODES); 
        }
    }, [props.isLoadingReportData]);

    if (props.isLoadingReportData) {
        return <FullscreenLoadingIndicator />;
    }

    const rest = _.omit(props, ['forwardedRef']);
    return (
        <WrappedComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={props.forwardedRef}
        />
    );
}

withAccountOrRedirectIfNoRecoverCode.prototype = propTypes;
withAccountOrRedirectIfNoRecoverCode.defaultProps = defaultProps;
withAccountOrRedirectIfNoRecoverCode.displayName = `withAccountOrRedirectIfNoRecoverCodes(WrappedComponent)`;

export default compose(
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        account: {
            key: ONYXKEYS.ACCOUNT
        },
    }),
    withAccountOrRedirectIfNoRecoverCode,
)