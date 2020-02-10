// @flow
import * as React from 'react';
import styled from 'styled-components';
import SvgIcon from './svg-icon';

type Props = {
  onChange: (e: SyntheticEvent<>) => any,
  tagLabel: string,
  docTitle: string,
  docVersion: string,
  docBranch: string,
  docLog: string,
  selectable: boolean,
};
type State = {
  selected: boolean,
};

const StyledCard: React.ComponentType<{}> = styled.div`
  & {
    transition: all 0.1s ease-out;
  }
  height: 196px;
  width: 204px;
  border: 1px solid var(--hl-sm);
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0px var(--padding-md) var(--padding-md) 0px;
  color: var(--font-dark);
  border-radius: var(--radius-md);

  &:hover {
    border-color: var(--color-surprise);
    box-shadow: var(--padding-sm) var(--padding-sm) calc(var(--padding-xl), * 1.5)
      calc(0px - var(--padding-xl)) rgba(0, 0, 0, 0.2);
    cursor: pointer;
    .title {
      color: var(--color-surprise);
    }
  }

  &.selected {
    background-color: rgba(var(--color-surprise-rgb), 0.05);
    border-color: var(--color-surprise);
    .title {
      color: var(--color-surprise);
    }
    cursor: default;
    &:hover {
      box-shadow: none;
    }
  }

  &.deselected {
    background-color: none;
    border: 1px solid var(--hl-sm);
    cursor: default;
    &:hover {
      border-color: var(--color-surprise);
      box-shadow: 3px 3px 20px -10px rgba(0, 0, 0, 0.2);
    }
  }
`;

const CardHeader: React.ComponentType<{}> = styled.div`
  text-align: left;
  padding-top: var(--padding-md);
  padding-right: var(--padding-sm);
  display: flex;
  justify-content: space-between;

  .header-item {
    font-size: var(--font-size-xs);
    padding: var(--padding-xs);
  }

  .card-badge {
    background-color: var(--hl-xs);
    width: calc(var(--font-size-xl) * 2.4);
    border-top-right-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    padding-left: var(--padding-md);
  }

  .card-menu {
    padding: 0px var(--padding-sm) 0px 0px;
    display: flex;
    align-items: center;
    font-weight: 900;
    font-size: var(--font-size-xl);
    color: var(--font-color);
  }

  .card-checkbox-label {
    display: block;
    position: relative;
    margin: auto;
    cursor: default;
    font-size: var(--font-size-xl);
    line-height: var(--font-size-xl);
    height: var(--font-size-xl);
    width: var(--font-size-xl);
    clear: both;

    .card-checkbox {
      position: absolute;
      top: 0;
      left: 0;
      height: var(--font-size-xl);
      width: var(--font-size-xl);
      background-color: rgba(var(--color-surprise-rgb), 0.1);
      border-radius: var(--radius-md);
      border: 2px solid var(--color-surprise);

      &::after {
        position: absolute;
        content: '';
        height: 0px;
        width: 0px;
        border-radius: var(--radius-md);
        border: solid var(--color-font-info);
        border-width: 0 var(--padding-sm) var(--padding-sm) 0;
        transform: rotate(0deg) scale(0);
        opacity: 1;
      }
    }

    input {
      position: absolute;
      opacity: 0;
      cursor: default;

      &:checked ~ .card-checkbox {
        background-color: var(--color-surprise);
        border-radius: var(--radius-md);
        transform: rotate(0deg) scale(1);
        opacity: 1;

        &::after {
          transform: rotate(45deg) scale(1);
          opacity: 1;
          left: 0.375rem;
          top: 0.125rem;
          width: 0.3125rem;
          height: 0.625rem;
          border: solid var(--color-bg);
          border-width: 0 2px 2px 0;
          background-color: transparent;
          border-radius: 0;
        }
      }
    }
  }
`;

const CardBody: React.ComponentType<{}> = styled.div`
  justify-content: normal;
  font-weight: 400;
  color: var(--font-color);
  margin-top: var(--padding-md);
  padding-left: var(--padding-md);
  .title {
    font-size: var(--font-size-md);
  }

  .version {
    font-size: var(--font-size-xs);
    padding-top: var(--padding-xs);
  }
`;

const CardFooter: React.ComponentType<{}> = styled.div`
  margin-top: auto;
  padding-left: var(--padding-md);
  padding-bottom: var(--padding-sm);
  color: var(--hl-xl);

  span {
    display: flex;
    justify-content: left;
    flex-direction: row;
  }

  .icoLabel {
    margin-bottom: var(--padding-xxs);
    padding-left: var(--padding-xs);
    font-size: var(--font-size-sm);
  }

  span {
    svg {
      width: 1em;
      height: 1em;
    }
  }
`;

class Card extends React.PureComponent<Props, State> {
  state = {
    selected: false,
    selectable: false,
  };

  _handleOnChange(e:SyntheticInputEvent<>) {
    this.setState({selected: !this.state.selected});
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    const { tagLabel, docTitle, docVersion, docBranch, docLog, selectable } = this.props;
    return (
      <StyledCard className={this.state.selected ? 'selected' : 'deselected'}>
        <CardHeader>
          <div className="header-item card-badge">{tagLabel}</div>
          {selectable ? (
            <div className="header-item card-menu">
              <label className="card-checkbox-label">
                <input
                  type="checkbox"
                  onChange={this._handleOnChange.bind(this)}
                />
                <span className="card-checkbox" />
              </label>
            </div>
          ) : (
            <div className="header-item card-menu">...</div>
          )}
        </CardHeader>
        <CardBody>
          <div className="title">{docTitle}</div>
          <div className="version">{docVersion}</div>
        </CardBody>
        <CardFooter>
          <span>
            <SvgIcon icon="github-logo" />
            <div className="icoLabel">{docBranch}</div>
          </span>
          <span>
            <SvgIcon icon="clock" />
            <div className="icoLabel">{docLog}</div>
          </span>
        </CardFooter>
      </StyledCard>
    );
  }
}

export default Card;