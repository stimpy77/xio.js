using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace xio.js.spec
{
    /// <summary>
    /// This is just a test support class for xio.spec.js which is the client-side unit tests for xio.js
    /// </summary>
    public class Sample1Controller : ApiController
    {
        [HttpGet]
        public object Get(string key)
        {
            return new
                {
                    name=key,
                    value=key+"__VALUE"
                };
        }
    }
}