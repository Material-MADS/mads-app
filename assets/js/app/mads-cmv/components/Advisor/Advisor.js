/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Floating Advisor UI component for CADS.
// ------------------------------------------------------------------------------------------------
// Notes: Displays advisor messages in a small floating window.
// ------------------------------------------------------------------------------------------------
// References: React + semantic-ui-react
=================================================================================================*/

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import './style.css';

export default function Advisor({ enabled, messages, isMinimized, onToggleMinimize }) {
  if (!enabled) {
    return null;
  }

  const hasMessages = messages.length > 0;

  if (isMinimized) {
    return (
      <div className="advisor-minimized" onClick={() => onToggleMinimize(false)}>
        <Icon name="help circle" /> Advisor
      </div>
    );
  }

  return (
    <div className="advisor-floating" role="complementary" aria-label="CADS Advisor">
      <div className="advisor-header">
        <div className="advisor-title">
          <Icon name="help circle" /> Advisor
        </div>
        <Button
          icon
          size="mini"
          className="advisor-minimize-button"
          onClick={() => onToggleMinimize(true)}
        >
          <Icon name="minus" />
        </Button>
      </div>
      <div className="advisor-body">
        {hasMessages ? (
          messages.map((message) => (
            <div key={message.id} className={`advisor-message advisor-message-${message.type}`}>
              <div className="advisor-message-header">
                {message.title}
              </div>
              <div className="advisor-message-content">
                <div className="advisor-message-body">{message.body}</div>
                {message.imageUrl ? (
                  <img className="advisor-message-image" src={message.imageUrl} alt={message.title || 'Advisor image'} />
                ) : null}
                {message.link ? (
                  <div className="advisor-message-link">
                    <a href={message.link.href} target={message.link.target || '_blank'} rel="noreferrer">
                      {message.link.label || message.link.href}
                    </a>
                  </div>
                ) : null}
                {message.actions && message.actions.length > 0 ? (
                  <div className="advisor-message-actions">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        basic
                        compact
                        size="mini"
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="advisor-empty">
            The Advisor is enabled and ready to display messages.
          </div>
        )}
      </div>
    </div>
  );
}

Advisor.propTypes = {
  enabled: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    imageUrl: PropTypes.string,
    link: PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string,
      target: PropTypes.string,
    }),
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
      })
    ),
    type: PropTypes.string,
    createdAt: PropTypes.string,
  })).isRequired,
  isMinimized: PropTypes.bool.isRequired,
  onToggleMinimize: PropTypes.func.isRequired,
};
