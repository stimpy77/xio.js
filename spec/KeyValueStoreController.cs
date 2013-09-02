using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json.Linq;

namespace xio.js.spec
{
    public class KeyValueStoreController : ApiController
    {
        static Dictionary<string, object> _values = new Dictionary<string, object>(); 

        public object Get(string key)
        {
            return Get(key, "GET");
        }
        public object Get(string key, string method)
        {
            switch (method)
            {
                case "DELETE":
                    Delete(key);
                    return null;
                case "GET":
                    return _values[key];
                default:
                    throw new ArgumentException("method");
            }
        }

        public void Post(string key, [FromBody]JObject value)
        {
            _values.Add(key, value);
        }

        public void Put(string key, object value)
        {
            if (!_values.ContainsKey(key)) throw new ArgumentException("Key not found", "key");
            _values[key] = value;
        }

        public object Patch(string key, object value)
        {
            var dynval = (dynamic) value;
            var item = (dynamic)_values[key];
            foreach (var field in dynval.Keys)
            {
                item[field] = dynval[field];
            }
            return item;
        }

        public void Delete(string key)
        {
            _values.Remove(key);
        }
    }
}